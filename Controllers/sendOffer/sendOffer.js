const sendOffer = require('../../Models/sendOffer');

exports.sendOfferPost = async (req, res) => {
    try {
        const { description, budget, delivery_time, revisions, services } = req.body;
          const sendoffer = await sendOffer.create({
            description: description,
            budget: budget,
            delivery_time: delivery_time,
            revisions: revisions,
            services: services
          });
          res.status(200).send(sendoffer);
          console.log(sendOffer);
    } catch (err) {
        console.log(err);
        res.send({ err })
    }
}


exports.sendOfferGet = async (req, res) => {
  try {
    const lastEntry = await sendOffer.findOne({}).sort({ createdAt: -1 });
    if (!lastEntry) {
      return res.status(404).json({ message: 'No data found' });
    }
    return res.status(200).json({ data: lastEntry });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};