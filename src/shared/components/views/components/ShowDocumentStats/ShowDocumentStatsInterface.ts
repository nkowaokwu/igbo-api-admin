interface DocumentStats {
  approvals: string[] | { displayName: string, email: string }[],
  denials: string[] | { displayName: string, email: string }[],
  author?: { [key: string]: string },
  merged?: string,
  collection?: string,
};

export default DocumentStats;
