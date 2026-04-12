import { Outlet } from 'react-router-dom'
import StudentSidebar from '../student/StudentSidebar'

export default function StudentShell() {
  return (
    <div className="flex w-full max-w-[1600px] gap-0">
      <StudentSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
