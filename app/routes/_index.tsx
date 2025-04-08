import { useState } from 'react';
import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, Link, redirect, Form } from '@remix-run/react';
import { Campaign, getCampaigns, addCampaign, deleteCampaign } from '../lib/data.server';

export const loader: LoaderFunction = async () => {
    const campaigns = await getCampaigns();
    return campaigns;
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const actionType = form.get('_action');

    try {
        if (actionType === 'addCampaign') {
            await addCampaign({
                name: String(form.get('name')),
                daily_budget: parseFloat(String(form.get('daily_budget'))),
            });
        } else if (actionType === 'deleteCampaign') {
            await deleteCampaign(Number(form.get('campaign_id')));
        }
    } catch (error: any) {
        return { error: error.message };
    }

    return redirect('/');
};

export default function Index() {
    const [open, setOpen] = useState(false);
    const [showIdFirst, setShowIdFirst] = useState(true);

    const headers = showIdFirst ? ['ID', 'Name'] : ['Name', 'ID'];
    const accessors = showIdFirst ? ['id', 'name'] : ['name', 'id'];

    const campaigns: Campaign[] = useLoaderData();
    console.log(campaigns);

    return (
        <>
            {/* Modal */}
            {open && (
                <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-xl w-full max-w-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>New Campaign</h2>
                            <button onClick={() => setOpen(false)} className='text-gray-500 hover:text-black'>
                                &times;
                            </button>
                        </div>

                        <Form method='post' className='space-y-3' onSubmit={() => setOpen(false)}>
                            <input type='hidden' name='_action' value='addCampaign' />

                            <input
                                name='name'
                                placeholder='Campaign Name'
                                className='border p-2 w-full rounded'
                                required
                            />

                            <input
                                name='daily_budget'
                                type='number'
                                step='0.01'
                                placeholder='Daily Budget'
                                className='border p-2 w-full rounded'
                                required
                            />

                            <div className='flex justify-end space-x-2'>
                                <button
                                    type='button'
                                    onClick={() => setOpen(false)}
                                    className='px-4 py-2 bg-gray-200 rounded'
                                >
                                    Cancel
                                </button>
                                <button type='submit' className='px-4 py-2 bg-green-600 text-white rounded'>
                                    Create
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            <div className='flex flex-col h-screen items-center justify-center'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold mb-4'>Ad Campaigns</h1>
                    <button onClick={() => setOpen(true)} className='bg-blue-600 text-white px-4 py-2 rounded'>
                        Add campaign
                    </button>
                </div>

                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-semibold'>Campaigns</h2>
                    <button
                        onClick={() => setShowIdFirst((prev) => !prev)}
                        className='text-sm bg-gray-200 px-3 py-1 rounded'
                    >
                        Toggle Column Order
                    </button>
                </div>

                <table className='min-w-full border border-gray-300 text-sm'>
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
                            <tr key={campaign.id} className='border-t hover:bg-gray-50'>
                                <td className='p-2 border'>{(campaign as any)[accessors[0]]}</td>
                                <td className='p-2 border'>{(campaign as any)[accessors[1]]}</td>
                                <td className='p-2 border space-x-2'>
                                    <button className='text-blue-600 hover:underline text-sm'>Edit</button>

                                    <Form method='post' className='inline'>
                                        <input type='hidden' name='_action' value='deleteCampaign' />
                                        <input type='hidden' name='campaign_id' value={campaign.id} />
                                        <button type='submit' className='text-red-600 hover:underline text-sm'>
                                            Delete
                                        </button>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
