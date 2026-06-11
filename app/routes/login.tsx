import { type ActionFunctionArgs } from 'react-router';
import { Form, useActionData } from 'react-router';
import { verifyLogin } from '~/utils/auth.server';
import { createUserSession, getUserId } from '~/utils/session.server';
import { redirect } from 'react-router';
import type { Route } from './+types/login';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect('/game');
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!email || !email.includes('@')) {
    errors.email = 'Valid email is required';
  }

  if (!password || password.length === 0) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const user = await verifyLogin(email, password);

    if (!user) {
      return {
        errors: {
          form: 'Invalid email or password',
        },
      };
    }

    return createUserSession(user.id, '/game');
  } catch (error) {
    console.error('Login error:', error);
    return { errors: { form: 'Failed to login. Please try again.' } };
  }
}

export default function Login({}: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Login to continue your Nepal geography adventure
            </p>
          </div>

          {/* Login Form */}
          <Form method="post" className="space-y-6">
            {/* Form-level error */}
            {actionData?.errors?.form && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.form}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  actionData?.errors?.email
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition`}
                placeholder="your.email@example.com"
              />
              {actionData?.errors?.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  actionData?.errors?.password
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition`}
                placeholder="Enter your password"
              />
              {actionData?.errors?.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {actionData.errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </Form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Register here
            </a>
          </p>
        </div>

        {/* Back to Home */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          <a href="/" className="hover:underline">
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
}
