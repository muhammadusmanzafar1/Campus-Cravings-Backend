const getAdminNotifications = async (userId) => {
    try {
      const notifications = await Notification.find({
        userId: userId, 
        status: 'unread', 
      }).populate('restaurantId');
  
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new ApiError('Failed to fetch notifications', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
  };