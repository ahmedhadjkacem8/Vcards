import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface CompanyFiltersProps {
  onFilterChange: (employeeId: string) => void;
}

const CompanyFilters = ({ onFilterChange }: CompanyFiltersProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [companyId, setCompanyId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchCompany = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/companies/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data && data.length > 0) {
          setCompanyId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };

    fetchCompany();
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const fetchEmployees = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/companies/${companyId}/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [companyId]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);
    onFilterChange(employeeId);
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedEmployee}
        onChange={handleFilterChange}
        className="h-10 w-44 rounded-md border border-input bg-background px-3 text-sm"
        aria-label="Filtrer par employé"
      >
        <option value="all">Tous les employés</option>
        {employees
          .filter(employee => employee.profile)
          .map((employee) => (
          <option key={employee.profile.id} value={employee.profile.id}>
            {employee.profile.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompanyFilters;
