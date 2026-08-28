const componentService = require("../service/component");

const getComponents = async (req, res) => {
  try {
    const components = await componentService.getComponents();
    console.log(components, "c");
    res.json(components);
  } catch (error) {
    console.log(error);
  }
};
const createComponent = async (req, res) => {
  try {
    const create = await componentService.createComponent(req.body);
    res.status(201).json(create);
  } catch (error) {
    res.status(500).json({ message: "Failed to create component" });
  }
};

const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await componentService.updateComponent(id, req.body);
    res.status(200).json(update);
  } catch (error) {
    res.status(500).json({ message: "Failed to update component" });
  }
};

const deleteComponent = async (req, res) => {
  try {
    const { performedByUserId } = req.query;
    const deleted = await componentService.deleteComponent(req.params.id, { performedByUserId });
    res.status(201).json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete component" });
  }
};

module.exports = {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
};
