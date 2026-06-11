import { redirect } from 'react-router';
import { logout } from '~/utils/session.server';
import type { Route } from './+types/logout';

export async function loader({ request }: Route.LoaderArgs) {
  return logout(request);
}

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}
