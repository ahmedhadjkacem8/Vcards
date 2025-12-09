import { useParams, useNavigate } from "react-router-dom";
import CompanyEditor from "@/components/CompanyEditor";

const CompanyEditPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const handleCompanyUpdate = () => {
    navigate("/dashboard/companies"); // Navigate to company listing after update
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{companyId ? "Edit Company" : "Create New Company"}</h1>
      <CompanyEditor companyId={companyId} onUpdate={handleCompanyUpdate} />
    </div>
  );
};

export default CompanyEditPage;
