import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async store(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schemaBody = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help Order does not exists.' });
    }

    const { student_id, question, answer, answer_at } = await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    await Queue.add(AnswerMail.key, helpOrder);

    return res.json({
      student_id,
      question,
      answer,
      answer_at,
    });
  }

  async list(req, res) {
    const helpOrder = await HelpOrder.findAll({ where: { answer: null } });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
