import * as Yup from 'yup';
import Student from '../models/Student';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const checkisStudent = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!checkisStudent) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const notifications = await Notification.find({
      user: req.params.id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const checkisStudent = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!checkisStudent) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
