import * as Yup from 'yup';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findByPk(req.params.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    await Checkin.create(req.params);

    return res.json({ ok: true });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findByPk(req.params.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const { student_id } = req.params;

    const checkin = await Checkin.findAll({
      where: { student_id },
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
