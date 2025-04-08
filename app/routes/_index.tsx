import { useState, useEffect } from 'react';
import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, redirect, Form, useNavigate } from '@remix-run/react';
import { Campaign, getCampaigns, addCampaign, editCampaign, deleteCampaign } from '../lib/data.server';

export const loader: LoaderFunction = async () => {
    const campaigns = await getCampaigns();
    return campaigns;
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const actionType = form.get('_action');

    try {
        if (actionType === 'addCampaign') {
            const name = String(form.get('name'));
            const daily_budget = parseFloat(String(form.get('daily_budget')));

            const campaigns = await getCampaigns();
            const nameExists = campaigns.some((c) => c.name.toLowerCase() === name.toLowerCase());

            if (nameExists) {
                return { error: 'Campaign name already exists!' };
            }

            await addCampaign({ name, daily_budget });
        } else if (actionType === 'editCampaign') {
            const id = Number(form.get('campaign_id'));
            const name = String(form.get('name'));
            const daily_budget = parseFloat(String(form.get('daily_budget')));

            const campaigns = await getCampaigns();
            const duplicate = campaigns.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase());

            if (duplicate) {
                return { error: 'Campaign name already exists!' };
            }

            await editCampaign({ id, name, daily_budget });
        } else if (actionType === 'deleteCampaign') {
            await deleteCampaign(Number(form.get('campaign_id')));
        }
    } catch (error: any) {
        return { error: error.message };
    }

    return redirect('/');
};

export default function Index() {
    const [openCampaign, setOpenCampaign] = useState<'new' | Campaign | null>(null);
    const [showIdFirst, setShowIdFirst] = useState(true);
    const navigate = useNavigate();
    const actionData = useActionData<{ error?: string }>();

    const headers = showIdFirst ? ['ID', 'Name'] : ['Name', 'ID'];
    const accessors = showIdFirst ? ['id', 'name'] : ['name', 'id'];

    const campaigns: Campaign[] = useLoaderData();

    useEffect(() => {
        if (actionData?.error) {
            alert(actionData.error);
        }
    }, [actionData]);

    return (
        <>
            {/* Modal */}
            {openCampaign && (
                <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-xl w-full max-w-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>
                                {openCampaign === 'new' ? 'New Campaign' : 'Edit Campaign'}
                            </h2>
                            <button onClick={() => setOpenCampaign(null)} className='text-gray-500 hover:text-black'>
                                &times;
                            </button>
                        </div>

                        <Form method='post' className='space-y-3' onSubmit={() => setOpenCampaign(null)}>
                            <input
                                type='hidden'
                                name='_action'
                                value={openCampaign === 'new' ? 'addCampaign' : 'editCampaign'}
                            />
                            {openCampaign !== 'new' && (
                                <input type='hidden' name='campaign_id' value={openCampaign.id} />
                            )}

                            <input
                                name='name'
                                placeholder='Campaign Name'
                                className='border p-2 w-full rounded'
                                defaultValue={openCampaign === 'new' ? '' : openCampaign.name}
                                required
                            />

                            <input
                                name='daily_budget'
                                type='number'
                                step='0.01'
                                placeholder='Daily Budget'
                                className='border p-2 w-full rounded'
                                defaultValue={openCampaign === 'new' ? '' : openCampaign.daily_budget}
                                required
                            />

                            <div className='flex justify-end space-x-2'>
                                <button
                                    type='button'
                                    onClick={() => setOpenCampaign(null)}
                                    className='px-4 py-2 bg-gray-200 rounded'
                                >
                                    Cancel
                                </button>
                                <button type='submit' className='px-4 py-2 bg-green-600 text-white rounded'>
                                    {openCampaign === 'new' ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            <div className='flex h-screen items-center justify-center w-screen'>
                <div className='flex flex-col w-1/2'>
                    <div className='flex items-center justify-between w-100 m-5'>
                        <h1 className='text-2xl font-bold mb-4'>Ad Campaigns</h1>
                        <button
                            onClick={() => setOpenCampaign('new')}
                            className='bg-blue-600 text-white px-3 py-1 rounded'
                        >
                            Add campaign
                        </button>
                    </div>

                    {campaigns && campaigns.length > 0 ? (
                        <>
                            <div>
                                <button
                                    onClick={() => setShowIdFirst((prev) => !prev)}
                                    className='text-sm bg-gray-200 px-3 py-1 my-3 rounded'
                                >
                                    Toggle Column Order
                                </button>
                            </div>

                            <table className='border border-gray-300 text-sm '>
                                <thead className='bg-gray-100'>
                                    <tr>
                                        {headers.map((header) => (
                                            <th key={header} className='p-2 border'>
                                                {header}
                                            </th>
                                        ))}
                                        <th className='p-2 border'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((campaign) => (
                                        <tr
                                            key={campaign.id}
                                            className='border-t hover:bg-gray-50 cursor-pointer'
                                            onClick={() => navigate(`/campaign/${campaign.id}`)}
                                        >
                                            <td className='p-2 border text-center'>
                                                {(campaign as any)[accessors[0]]}
                                            </td>
                                            <td className='p-2 border text-center'>
                                                {(campaign as any)[accessors[1]]}
                                            </td>
                                            <td className='p-2 border text-center space-x-2'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenCampaign(campaign);
                                                    }}
                                                    className='text-blue-600 hover:underline text-sm'
                                                >
                                                    Edit
                                                </button>

                                                <Form method='post' className='inline'>
                                                    <input type='hidden' name='_action' value='deleteCampaign' />
                                                    <input type='hidden' name='campaign_id' value={campaign.id} />
                                                    <button
                                                        type='submit'
                                                        className='text-red-600 hover:underline text-sm'
                                                    >
                                                        Delete
                                                    </button>
                                                </Form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>No campaign found! Try adding campaigns...</p>
                    )}
                </div>
            </div>
        </>
    );
}
