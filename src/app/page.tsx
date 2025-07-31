import {redirect} from "next/navigation";
import {ROUTES_APP} from '@/components/features/student/routes';

export default function Page() {
    redirect(ROUTES_APP.root());
}