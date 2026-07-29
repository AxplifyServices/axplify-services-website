export type AuthenticatedUser = {
  id:
    string;

  email:
    string;

  firstName:
    string | null;

  lastName:
    string | null;

  roles:
    string[];

  mustChangePassword:
    boolean;
};