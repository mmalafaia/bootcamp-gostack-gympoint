import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params);

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help Order does not exists.' });
    }

    const { student_id, question, answer, answer_at } = await HelpOrder.update(
      req.body
    );

    return res.json({
      student_id,
      question,
      answer,
      answer_at,
    });
  }
}

export default new HelpOrderController();
