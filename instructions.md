### Implementation Plan                                          
                                                                   
  #### Phase 1: Database & Super Admin Role                        
                                                                   
  1. Schema Check (cloud-backend/prisma/schema.prisma):            
      • Add/verify SUPER_ADMIN or is_super_admin flag on the       
      Account/User model.                                          
      • Ensure Subscription tracks status, plan, and expires_at.   
  2. Seed Script / Script to create initial Super Admin:           
      • A command or seed script to create your root Super Admin   
      credentials securely in Neon DB.                             
                                                                   
  ──────                                                           
  #### Phase 2: Super Admin Backend Endpoints (cloud-backend)      
                                                                   
  Create a dedicated /api/super-admin module protected by          
  superAdminMiddleware:                                            
                                                                   
  1. POST /api/super-admin/login: Super Admin authentication.      
  2. POST /api/super-admin/tenants: Single transaction that        
  creates:                                                         
      • The Business profile (Name, address, currency, tax rate,   
      etc.)                                                        
      • The Employee & User record with role Owner                 
      • The initial Subscription with plan & duration (expires_at) 
  3. GET /api/super-admin/tenants: List all businesses, owners,    
  active users count, and subscription expiry statuses.            
  4. PUT /api/super-admin/tenants/:id/subscription: Extend         
  subscription expiration dates or toggle active/suspended status. 
  5. DELETE /api/super-admin/tenants/:id: Soft-delete or remove    
  tenants if needed.                                               
  ──────                                                           
  #### Phase 3: Super Admin Web UI (frontend)                      
                                                                   
  1. Super Admin Route (/super-admin or dedicated sub-domain/tab): 
      • Isolated Super Admin Login screen.                         
      • Super Admin Dashboard with:                                
          • Tenant List: Showing Business Name, Owner, Status      
          (Active/Trial/Expired), Expiration Date, and Action      
          buttons.                                                 
          • Create Business Modal/Form: Fields for Business Name,  
          Owner Name, Email/Username, Temporary Password,          
          Subscription Period (e.g., 30 days, 1 year).             
          • Subscription Management: Quick button to extend access 
          by +30 / +90 / +365 days.                                
                                                                   
                                                                   
  ──────                                                           
  #### Phase 4: Streamline the Web App Entrypoint (frontend)       
  
  1. Clean Route Isolation:
      • When VITE_MODE=cloud:
          • Bypass ActivationPage and SetupWizard.
          • Direct unauthenticated users to /login.
          • After login, direct users straight to their dashboard. 
  
  2. Subscription Expiry Interceptor:
      • If an account's subscription has expired in the cloud, show
      a polite "Subscription Expired - Please contact support/admin
      to renew" banner/screen.