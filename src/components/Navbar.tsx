import { Link } from "react-router-dom";
import NavbarLogo from "/assets/navbar-logo.png";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <img src={NavbarLogo} alt="logo" className="w-15 h-15" />
            </Link>
          </div>
          <div>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => navigate('/catalogue')}
            >
              Catalogue
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}