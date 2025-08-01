'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type StatsType = {
  totalUsers: number;
  totalProjects: number;
  activeSessions: number;
  storageUsed: string;
};

type ActivityType = {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  details?: Record<string, unknown>;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Debug logging for auth state
  console.log('Dashboard: Auth state -', { user, loading });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('Dashboard: Checking auth state -', { user, loading });
    
    // If we have a user, show the dashboard
    if (user && !loading) {
      console.log('Dashboard: User is authenticated, showing dashboard');
    } else if (!loading && !user) {
      console.log('Dashboard: No user and not loading, redirecting to login');
      // Add a small delay to prevent rapid redirects
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  const [stats, setStats] = useState<StatsType>({
    totalUsers: 0,
    totalProjects: 0,
    activeSessions: 0,
    storageUsed: '0 MB',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityType[]>([]);

  useEffect(() => {
    if (!user) return; // Don't fetch if user is not authenticated
    
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Fetching dashboard data for user:', user?.email);
        setIsLoading(true);
        const supabase = getSupabase();
        
        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch project count (adjust table name as needed)
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        // Fetch active sessions (this is a simplified example)
        const { data: sessions } = await supabase.auth.admin.listUsers();
        // Get active sessions by filtering users with last_sign_in_at
        const activeSessions = sessions?.users?.filter(
          (u) => u.last_sign_in_at
        ).length || 0;

        // Fetch storage usage
        const { data: buckets } = await supabase.storage.listBuckets();
        let totalSize = 0;
        
        // Calculate total size of all files in all buckets
        if (buckets) {
          for (const bucket of buckets) {
            const { data: files } = await supabase.storage
              .from(bucket.name)
              .list();
            
            if (files) {
              interface StorageFile {
                metadata: {
                  size?: number;
                  [key: string]: unknown;
                };
              }
              const bucketSize = files.reduce((sum: number, file: StorageFile) => 
                sum + (file.metadata?.size || 0), 0);
              totalSize += bucketSize;
            }
          }
        }
        
        const storageUsed = totalSize > 0 
          ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
          : '0 MB';

        setStats({
          totalUsers: userCount || 0,
          totalProjects: projectCount || 0,
          activeSessions,
          storageUsed,
        });

        // Fetch recent activity (adjust as needed)
        const { data: activity } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Type assertion to ensure the data matches our ActivityType
        const typedActivity = (activity || []) as ActivityType[];
        setRecentActivity(typedActivity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          icon={<UsersIcon className="h-6 w-6 text-blue-500" />}
        />
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects.toString()} 
          icon={<FolderIcon className="h-6 w-6 text-green-500" />}
        />
        <StatCard 
          title="Active Sessions" 
          value={stats.activeSessions.toString()} 
          icon={<UserGroupIcon className="h-6 w-6 text-yellow-500" />}
        />
        <StatCard 
          title="Storage Used" 
          value={stats.storageUsed} 
          icon={<ServerIcon className="h-6 w-6 text-purple-500" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <li key={activity.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {activity.action}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {activity.action}
                          {activity.details && (
                            <span className="ml-1 text-gray-400">
                              {JSON.stringify(activity.details)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-gray-500">
                No recent activity found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function UserGroupIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function ServerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>
  );
}
