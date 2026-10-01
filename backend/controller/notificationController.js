const Notification = require("../model/notification");
const Admin = require("../model/Admin");

// =====================================================
// GET ADMIN ID
// =====================================================

const getAdminId = (req) => {
  return req.admin?._id || req.admin?.id;
};

// =====================================================
// GET ADMIN NOTIFICATIONS
// =====================================================

const getAdminNotifications = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const notifications = await Notification.find({
      recipient: adminId,
    })
      .populate(
        "sender",
        "fullName email mobile profileImage"
      )
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipient: adminId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET ADMIN NOTIFICATIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

// =====================================================
// GET UNREAD COUNT
// =====================================================

const getUnreadNotificationCount = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const count = await Notification.countDocuments({
      recipient: adminId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "UNREAD COUNT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const adminId = getAdminId(req);
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          recipient: adminId,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        }
      ).populate(
        "sender",
        "fullName email mobile profileImage"
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "MARK READ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const result = await Notification.updateMany(
      {
        recipient: adminId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "MARK ALL READ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE NOTIFICATION
// =====================================================

const deleteNotification = async (req, res) => {
  try {
    const adminId = getAdminId(req);
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: id,
        recipient: adminId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  data = {},
}) => {
  try {
    if (!recipient) {
      console.error(
        "CREATE NOTIFICATION: recipient is missing"
      );

      return null;
    }

    const notification =
      await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link,
        data,
      });

    return notification;
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    return null;
  }
};

// =====================================================
// GET ALL ACTIVE ADMINS
// =====================================================

const getAdmins = async () => {
  try {
    const admins = await Admin.find({
      isActive: {
        $ne: false,
      },
    }).select(
      "_id fullName email"
    );

    return admins;
  } catch (error) {
    console.error(
      "GET ADMINS ERROR:",
      error
    );

    return [];
  }
};

// =====================================================
// CREATE NOTIFICATION FOR ALL ADMINS
// =====================================================

const notifyAllAdmins = async ({
  sender = null,
  type,
  title,
  message,
  link = "",
  data = {},
}) => {
  try {
    const admins = await getAdmins();

    if (!admins.length) {
      console.log(
        "NOTIFY ADMINS: No active admin found"
      );

      return [];
    }

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      sender,
      type,
      title,
      message,
      link,
      data,
      isRead: false,
    }));

    const result =
      await Notification.insertMany(
        notifications
      );

    console.log(
      `NOTIFY ADMINS: ${result.length} notification(s) created`
    );

    return result;
  } catch (error) {
    console.error(
      "NOTIFY ADMINS ERROR:",
      error
    );

    return [];
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  notifyAllAdmins,
};