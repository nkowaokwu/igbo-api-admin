enum Views {
  /**
   * Detailed view of a selected document
   */
  SHOW = 'show',
  /**
   * View that allows an editor to update a document
   * with a provided form
   */
  EDIT = 'edit',
  /**
   * View that allows an editor to create a new suggestion
   */
  CREATE = 'create',
  /**
   * Lists all documents for the selected collection
   *
   * The detail number of documents rendered is ten
   */
  LIST = 'list',
};

export default Views;
