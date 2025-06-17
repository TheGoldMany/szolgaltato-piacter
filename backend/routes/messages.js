const express = require('express');
const messagesRouter = express.Router();

// Get conversations for user
messagesRouter.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT DISTINCT ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END
      )
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as participant_id,
        u.first_name,
        u.last_name,
        sp.business_name,
        sp.profile_image_url,
        m.content as last_message,
        m.created_at as last_message_at,
        m.is_read,
        m.sender_id = $1 as sent_by_me,
        (SELECT COUNT(*) 
         FROM messages m2 
         WHERE m2.receiver_id = $1 
         AND m2.sender_id = (
           CASE 
             WHEN m.sender_id = $1 THEN m.receiver_id 
             ELSE m.sender_id 
           END
         )
         AND m2.is_read = false
        ) as unread_count
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id = u.id
          ELSE m.sender_id = u.id
        END
      )
      LEFT JOIN service_profiles sp ON u.id = sp.user_id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END
      ), m.created_at DESC
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

// Get messages between two users
messagesRouter.get('/conversation/:participantId', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { participantId } = req.params;

    const result = await pool.query(`
      SELECT 
        m.id,
        m.uuid,
        m.content,
        m.message_type,
        m.sender_id,
        m.receiver_id,
        m.is_read,
        m.created_at,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [userId, participantId]);

    // Mark messages as read
    await pool.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [participantId, userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba az üzenetek betöltése során'
    });
  }
});

// Send message
messagesRouter.post('/send', authenticateToken, async (req, res) => {
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
messagesRouter.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id: messageId } = req.params;
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

module.exports = { router, messagesRouter };