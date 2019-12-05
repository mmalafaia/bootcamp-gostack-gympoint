import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async list(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const enrollment = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      limit: 20,
      offset: (page - 1) * 20,
    });
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

    const enrollment = await Enrollment.findOne({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      where: { id },
    });

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

    await Queue.add(EnrollmentMail.key, {
      enrollment: enrollment.dataValues,
      plan: plan.dataValues,
      student: student.dataValues,
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
      price: Yup.number(),
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

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    await enrollment.destroy(req.params);

    await Queue.add(EnrollmentMail.key, {
      enrollment,
    });

    return res.json({ ok: true });
  }
}

export default new EnrollmentController();
