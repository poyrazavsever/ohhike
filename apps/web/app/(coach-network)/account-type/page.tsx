import { AccountTypePicker } from "./_components/account-type-picker";
import { resolveAccountTypeRedirect } from "./actions";

export default async function AccountTypePage() {
  await resolveAccountTypeRedirect();

  return <AccountTypePicker />;
}
