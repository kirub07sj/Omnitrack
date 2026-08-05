import { Employee } from "../types/employee";

export const EmployeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    // For now, assume a hardcoded or single business ID until auth is fully implemented
    const businessId = "1";
    if (!businessId) throw new Error("No business selected");
    
    const response = await fetch(`/api/employees?business_id=${businessId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    const data = await response.json();
    // Map snake_case to camelCase
    return data.map((emp: any) => ({
      ...emp,
      firstName: emp.first_name,
      lastName: emp.last_name,
      dateOfBirth: emp.date_of_birth,
      phoneNumber: emp.phone,
      nationalId: emp.national_id,
      emergencyContact: emp.emergency_contact,
      employeeNumber: emp.employee_number,
      employmentType: emp.employment_type,
      hireDate: emp.hire_date,
      hasLoginAccount: emp.users && emp.users.length > 0
    }));
  },
  
  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    const response = await fetch(`/api/employees/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error("Failed to fetch employee");
    }
    const emp = await response.json();
    return {
      ...emp,
      firstName: emp.first_name,
      lastName: emp.last_name,
      dateOfBirth: emp.date_of_birth,
      phoneNumber: emp.phone,
      nationalId: emp.national_id,
      emergencyContact: emp.emergency_contact,
      employeeNumber: emp.employee_number,
      employmentType: emp.employment_type,
      hireDate: emp.hire_date,
      hasLoginAccount: emp.users && emp.users.length > 0,
      username: emp.users && emp.users.length > 0 ? emp.users[0].username : undefined,
    };
  },

  createEmployee: async (data: any): Promise<Employee> => {
    const businessId = "1";
    if (!businessId) throw new Error("No business selected");

    const payload = { 
      business_id: businessId,
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      date_of_birth: data.dateOfBirth,
      phone: data.phoneNumber,
      email: data.email,
      address: data.address,
      national_id: data.nationalId,
      emergency_contact: data.emergencyContact,
      employee_number: data.employeeNumber,
      position: data.position,
      department: data.department,
      salary: data.salary,
      employment_type: data.employmentType,
      hire_date: data.hireDate,
      status: data.status,
      createLoginAccount: data.createLoginAccount,
      username: data.username,
      password_hash: data.password, // This should be a hash in a real app
      // Find role_id based on role name
      // This is mocked for now, usually you'd query the DB for the role ID
      role_id: data.role ? "1" : undefined
    };

    const response = await fetch(`/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error("Failed to create employee");
    }
    const emp = await response.json();
    return emp;
  },

  updateEmployee: async (id: string, data: any): Promise<Employee> => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      date_of_birth: data.dateOfBirth,
      phone: data.phoneNumber,
      email: data.email,
      address: data.address,
      national_id: data.nationalId,
      emergency_contact: data.emergencyContact,
      employee_number: data.employeeNumber,
      position: data.position,
      department: data.department,
      salary: data.salary,
      employment_type: data.employmentType,
      hire_date: data.hireDate,
      status: data.status,
    };
    
    // Remove undefined values
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    const response = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error("Failed to update employee");
    }
    return response.json();
  },

  deleteEmployee: async (id: string): Promise<void> => {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete employee");
    }
  }
};
