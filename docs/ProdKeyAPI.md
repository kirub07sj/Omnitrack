Please help me integrate the "ProdKey" License Manager into my     
  product (OmniTrack).                                                 
                                                                       
    I need you to build the `licenseService` module and the core logic 
  for the app's startup license checks based on the following          
  architectural requirements:                                          
                                                                       
    ### 1. Configuration & Setup                                       
    - The service needs to pull 3 environment variables:               
  `LICENSE_SERVER_URL`, `PRODUCT_API_KEY`, and `SIGNING_PUBLIC_KEY`.   
    - All requests to the license server must include the header: `x-  
  product-api-key: <PRODUCT_API_KEY>`. here is the api key:                                
    - You will need to implement a function to generate a stable,      
  unique `deviceId` for the current machine (e.g., using a MAC address 
  or hostname hash).                                                   
                                                                       
    ### 2. License Service Methods                                     
    Please create a standalone `licenseService` module with the        
  following functions:                                                 
    - `activate(licenseKey)`: Calls `POST /public/activate` with `{    
  licenseKey, deviceId }`. On success, it receives a signed certificate.
  This certificate must be persisted to local storage (e.g., a local   
  config file or SQLite database).                                     
    - `validate()`: Calls `POST /public/validate` with `{ licenseKey,  
  deviceId }` to refresh the stored certificate.                       
    - `deactivate()`: Calls `POST /public/deactivate` to free up the   
  activation slot.                                                     
    - `verifyCertificateLocally(cert)`: Parses the stored certificate  
  `base64url(payload) + "." + base64url(Ed25519 signature)` and        
  verifies the signature using the `SIGNING_PUBLIC_KEY` (using Node    
  `crypto.verify` or WebCrypto). It should return the parsed claims    
  (`status`, `expiresAt`, `validUntil`, `plan`) or throw an error if   
  tampered with.                                                       
    - `getLicenseState()`: Reads the stored certificate from local     
  storage, verifies it locally, and returns the current state.         
                                                                       
    ### 3. Application Startup Logic (Offline-First)                   
    Please also provide the logic to be run on application startup:    
    1. Load the stored certificate and verify it locally. If the       
  signature is invalid or `status === 'revoked'`, **block the app**.   
    2. If `now < validUntil` (grace period), **allow the app to run**  
  (offline is OK).
    3. If `now >= validUntil`, attempt an online `validate()`. If it   
  succeeds, update the certificate and allow. If it fails due to       
  network, prompt the user.
    4. If `expiresAt` has passed, **block the app**.
  
    ### 4. Implementation Guidelines
    - The license server returns HTTP errors like `400` (malformed),   
  `401` (invalid key), `403` (revoked/expired), and `409` (max         
  activations reached). Please handle these gracefully and surface     
  human-readable errors.
    - Never store the raw `licenseKey` permanently; only store the     
  signed certificate.
    - Keep the `licenseService` decoupled from the UI components so it 
  can easily be wired into a setup wizard later.
  
    Please write the `licenseService` file first, including the        
  cryptographic verification and local persistence logic.
    ```***