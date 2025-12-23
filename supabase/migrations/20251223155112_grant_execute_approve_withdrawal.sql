/*
  # Grant Execute Permission for Approve Withdrawal Function

  1. Permissions
    - Grant EXECUTE permission on approve_withdrawal function to authenticated users
    - Function internally checks for admin role
*/

GRANT EXECUTE ON FUNCTION approve_withdrawal(UUID) TO authenticated;
