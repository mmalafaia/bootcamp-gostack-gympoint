import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async list(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const plan = await Plan.findAll({ limit: 20, offset: (page - 1) * 20 });
    return res.json(plan);
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const plan = await Plan.findOne({ where: { id } });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not extists' });
    }

    return res.json(plan);
  }

  async store(req, res) {
    const schemaBody = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
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
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const plan = await Plan.findOne({ where: { id } });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
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

    const plan = await Plan.findOne({ where: { id } });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    await plan.destroy(req.params);

    return res.json({ ok: true });
  }
}

export default new PlanController();
