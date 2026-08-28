const service = require("../service/manufecturer");
/* Get All */
exports.getAll = async (req, res) => {
  try {
    const data = await service.getAllManufacturers();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch manufacturers" });
  }
};

/* Get By ID */
exports.getById = async (req, res) => {
  try {
    const data = await service.getManufacturerById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching manufacturer" });
  }
};

/* Create */
exports.create = async (req, res) => {
  try {
    const result = await service.createManufacturer(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create manufacturer" });
  }
};

/* Update */
exports.update = async (req, res) => {
  try {
    const updated = await service.updateManufacturer(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update manufacturer" });
  }
};

/* Delete */
exports.delete = async (req, res) => {
  try {
    const { performedByUserId } = req.query;
    await service.deleteManufacturer(req.params.id, { performedByUserId });
    res.json({ message: "Manufacturer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete manufacturer" });
  }
};
