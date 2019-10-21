import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async list(req, res) {
    const enrollment = await Enrollment.findAll();
    return res.json(enrollment);
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({ where: { id } });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not extists' });
    }

    return res.json(enrollment);
  }

  async store(req, res) {
    const schemaBody = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
      plan_id: Yup.number()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.body.student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not Extists' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not Extists' });
    }

    const hourStart = startOfHour(parseISO(req.body.start_date));

    if (isBefore(hourStart, new Date())) {
      res.status(400).json({ error: 'Past dates are not permited' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const price = plan.price * plan.duration;
    const end_date = addMonths(parseISO(start_date), plan.duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schemaBody = Yup.object().shape({
      student_id: Yup.number().integer(),
      plan_id: Yup.number().integer(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      price: Yup.number().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({ where: { id } });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    const {
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    } = await enrollment.update(req.body);

    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({ where: { id } });

    if (!enrollment) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    await enrollment.destroy(req.params);

    return res.json({ ok: true });
  }
}

export default new EnrollmentController();
