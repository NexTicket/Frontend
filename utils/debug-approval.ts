// Debug utility to test the complete admin approval workflow
// This file helps test the tenant creation and Firebase custom claims flow

export const debugApprovalWorkflow = {
  
  // Test EVMS server connectivity
  testEVMSConnection: async () => {
    console.log('🔍 Testing EVMS server connection...');
    try {
      const response = await fetch('http://localhost:4000/api/tenants/health');
      const data = await response.json();
      console.log('✅ EVMS server is accessible:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ EVMS server connection failed:', error);
      return { success: false, error };
    }
  },

  // Test tenant creation endpoint
  testTenantCreation: async (mockTenantData: any) => {
    console.log('🔍 Testing tenant creation...', mockTenantData);
    try {
      // Test without authentication first
      const response = await fetch('http://localhost:4000/api/tenants/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockTenantData)
      });
      const data = await response.json();
      console.log('✅ Tenant test endpoint working:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Tenant creation test failed:', error);
      return { success: false, error };
    }
  },

  // Test Firebase custom claims endpoint
  testCustomClaims: async (mockClaimsData: any) => {
    console.log('🔍 Testing Firebase custom claims endpoint...', mockClaimsData);
    try {
      const response = await fetch('http://localhost:4000/api/users/set-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockClaimsData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Custom claims endpoint accessible:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Custom claims test failed:', error);
      return { success: false, error };
    }
  },

  // Run complete workflow test
  runCompleteTest: async () => {
    console.log('🚀 Starting complete admin approval workflow test...');
    
    const results = {
      evmsConnection: await debugApprovalWorkflow.testEVMSConnection(),
      tenantCreation: await debugApprovalWorkflow.testTenantCreation({
        firebaseUid: 'test-uid-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'venue_owner'
      }),
      customClaims: await debugApprovalWorkflow.testCustomClaims({
        firebaseUid: 'test-uid-123',
        claims: { role: 'venue_owner' }
      })
    };

    console.log('🎯 Complete test results:', results);
    
    const allPassed = Object.values(results).every(result => result.success);
    console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
    
    return results;
  }
};

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugApprovalWorkflow = debugApprovalWorkflow;
}
