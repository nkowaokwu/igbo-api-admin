import UserRoles from 'src/backend/shared/constants/UserRoles';

enum ProjectUserRoles {
  ADMIN = UserRoles.ADMIN,
  MERGER = UserRoles.MERGER,
  CROWDSOURCER = UserRoles.CROWDSOURCER,
}

export default ProjectUserRoles;
