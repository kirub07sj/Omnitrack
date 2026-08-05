import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployeeService } from "../services/employee.service";
import { Employee } from "../types/employee";
import { EmployeeAvatar } from "../components/EmployeeAvatar";
import { EmployeeStatusBadge } from "../components/EmployeeStatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, Briefcase, Calendar } from "lucide-react";

export default function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      EmployeeService.getEmployeeById(id).then(data => {
        if (data) setEmployee(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center">
        <h2 className="text-2xl font-bold text-foreground">Employee Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The employee you are looking for does not exist.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Employee Profile
            <EmployeeStatusBadge status={employee.status} />
          </h1>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Edit className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border md:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <EmployeeAvatar 
              firstName={employee.firstName} 
              lastName={employee.lastName} 
              url={employee.avatarUrl}
              className="w-24 h-24 text-2xl mb-4" 
            />
            <h2 className="text-xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h2>
            <p className="text-primary font-medium mt-1">{employee.position}</p>
            <p className="text-sm text-muted-foreground mt-1">{employee.department}</p>
            
            <div className="w-full flex flex-col gap-3 mt-8 text-left">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-foreground" />
                <span>{employee.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-foreground" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <span>{employee.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted border-border w-full justify-start rounded-md h-12 px-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium text-foreground">{employee.firstName} {employee.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Gender</p>
                      <p className="font-medium text-foreground">{employee.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                      <p className="font-medium text-foreground">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">National ID</p>
                      <p className="font-medium text-foreground">{employee.nationalId || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                      <p className="font-medium text-foreground">{employee.emergencyContact}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employment">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Briefcase className="w-4 h-4" /> Employee ID
                      </div>
                      <p className="font-medium text-foreground">{employee.employeeNumber}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Building className="w-4 h-4" /> Department
                      </div>
                      <p className="font-medium text-foreground">{employee.department}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" /> Hire Date
                      </div>
                      <p className="font-medium text-foreground">{new Date(employee.hireDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employment Type</p>
                      <p className="font-medium text-foreground">{employee.employmentType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Salary</p>
                      <p className="font-medium text-foreground">${employee.salary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">System Access</p>
                      <p className="font-medium text-foreground">{employee.hasLoginAccount ? `Yes (${employee.role})` : 'No'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                    Attendance module integration pending.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                    No recent activity found.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Employee Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                    No documents uploaded.
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
