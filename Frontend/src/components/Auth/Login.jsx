import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../store/api";
import { setCredentials } from "../../store/slices/authSlice";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      toast.success("Login successful!");
      navigate("/feed");
    } catch (error) {
      toast.error(error.data?.message || "Login failed");
    }
  };

  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      admin: { email: "admin@demo.com", password: "admin123" },
      user: { email: "user@demo.com", password: "user123" },
    };

    const { email, password } = demoCredentials[userType];

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      toast.success(`Logged in as demo ${userType}!`);
      navigate("/feed");
    } catch (error) {
      toast.error("Demo login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-linkedin-blue-900 flex items-center justify-center px-4 py-12 roboto">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4">
        {/* Logo */}
        {/* <div className="text-center pb-4 border-gray-200">
          <div className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">in</span>
            </div>
            <span className="text-3xl font-bold">UpNetic</span>
          </div>
          <p className="text-blue-500 font-semibold mt-2">
            Connect with professionals
          </p>
        </div> */}

        {/* Login Form */}
        <div className="card p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 poppins border-b border-gray-200 pb-4">
            SIGN IN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent outline-none transition-all duration-200 "
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent outline-none transition-all duration-200 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded-lg py-2 text-lg disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Try demo accounts:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin("admin")}
                className="btn-secondary py-2 text-sm cursor-pointer"
                disabled={isLoading}
              >
                Demo Admin
              </button>
              <button
                onClick={() => handleDemoLogin("user")}
                className="btn-secondary py-2 text-sm cursor-pointer"
                disabled={isLoading}
              >
                Demo User
              </button>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
