import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

export default function AdminUserCreate({ roles }) {
    return (
        <>
            <Head title="Nouvel utilisateur" />
            <UserForm roles={roles} mode="create" />
        </>
    );
}
