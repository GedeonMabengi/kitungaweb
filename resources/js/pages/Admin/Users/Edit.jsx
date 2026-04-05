import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

export default function AdminUserEdit({ user, roles }) {
    return (
        <>
            <Head title={`Modifier ${user.name}`} />
            <UserForm user={user} roles={roles} mode="edit" />
        </>
    );
}
