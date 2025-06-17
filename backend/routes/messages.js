// backend/routes/messages.js - VÉGLEGES JAVÍTOTT VERZIÓ
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.first_name,
        u.last_name,
        sp.business_name,
        sp.profile_image_url,
        MAX(m.created_at) as last_message_time,
        COUNT(CASE WHEN m.receiver_id = $1 AND m.is_read = false THEN 1 END) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = $1 THEN m.receiver_id 
        ELSE m.sender_id 
      END
      LEFT JOIN service_profiles sp ON u.id = sp.user_id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      GROUP BY other_user_id, u.first_name, u.last_name, sp.business_name, sp.profile_image_url
      ORDER BY last_message_time DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a beszélgetések betöltése során'
    });
  }
});

// Get messages with specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const { id: currentUserId } = req.user;

    const result = await pool.query(`
      SELECT m.*, 
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [currentUserId, otherUserId]);

    // Mark messages as read
    await pool.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [otherUserId, currentUserId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a beszélgetés betöltése során'
    });
  }
});

// Send new message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { id: senderId } = req.user;
    const { receiverId, content, messageType = 'text', projectId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Címzett és üzenet tartalom kötelező'
      });
    }

    const result = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, message_type, project_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [senderId, receiverId, content, messageType, projectId]);

    res.json({
      success: true,
      message: 'Üzenet sikeresen elküldve',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba az üzenet küldése során'
    });
  }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { id: userId } = req.user;

    const result = await pool.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `, [messageId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Üzenet nem található'
      });
    }

    res.json({
      success: true,
      message: 'Üzenet olvasottnak jelölve'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba az üzenet jelölése során'
    });
  }
});

// Get message statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN is_read = false AND receiver_id = $1 THEN 1 END) as unread_count,
        COUNT(DISTINCT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END) as conversation_count
      FROM messages 
      WHERE sender_id = $1 OR receiver_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a statisztikák betöltése során'
    });
  }
});

// ⚠️ FONTOS: Egyszerű export, nem objektum!
module.exports = router;