import { useState } from 'react';
import { LoaderFunction, LoaderFunctionArgs, ActionFunction } from '@remix-run/node';
import { useLoaderData, Link, redirect, Form } from '@remix-run/react';
import { CampaignDetails, getCampaignWithKeywords, addKeyword, deleteKeyword } from '../lib/data.server';

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
    if (params.id) {
        const campaignDetails = await getCampaignWithKeywords(parseInt(params.id));

        return campaignDetails;
    }

    return {};
};

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData();
    const actionType = form.get('_action');

    try {
        if (actionType === 'addKeyword') {
            await addKeyword({
                campaign_id: Number(form.get('campaign_id')),
                text: String(form.get('text')),
                bid: parseFloat(String(form.get('bid'))),
                match_type: String(form.get('match_type')) as any,
                state: String(form.get('state')) as any,
            });
        } else if (actionType === 'deleteKeyword') {
            await deleteKeyword(Number(form.get('keyword_id')));
        }
    } catch (error: any) {
        return { error: error.message };
    }

    return redirect(`/campaign/${params.id}`);
};

export default function CampaignDetailsPage() {
    const [open, setOpen] = useState(false);
    const [showIdFirst, setShowIdFirst] = useState(true);

    const headers = showIdFirst ? ['ID', 'Text'] : ['Text', 'ID'];
    const accessors = showIdFirst ? ['id', 'text'] : ['text', 'id'];

    const campaignDetails: CampaignDetails = useLoaderData();
    const { keywords } = campaignDetails;

    return (
        <>
            {/* Modal */}
            {open && (
                <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-xl w-full max-w-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Add Keyword</h2>
                            <button onClick={() => setOpen(false)} className='text-gray-500 hover:text-black'>
                                &times;
                            </button>
                        </div>

                        <Form method='post' className='space-y-3' onSubmit={() => setOpen(false)}>
                            <input type='hidden' name='_action' value='addKeyword' />
                            <input type='hidden' name='campaign_id' value={campaignDetails.id} />

                            <input
                                name='text'
                                placeholder='Keyword Text'
                                className='border p-2 w-full rounded'
                                required
                            />

                            <input
                                name='bid'
                                type='number'
                                step='0.01'
                                placeholder='Bid Amount'
                                className='border p-2 w-full rounded'
                                required
                            />

                            <select name='match_type' className='border p-2 w-full rounded' required>
                                <option value=''>Match Type</option>
                                <option value='exact'>Exact</option>
                                <option value='phrase'>Phrase</option>
                                <option value='broad'>Broad</option>
                            </select>

                            <select name='state' className='border p-2 w-full rounded' required>
                                <option value=''>State</option>
                                <option value='enabled'>Enabled</option>
                                <option value='disabled'>Disabled</option>
                            </select>

                            <div className='flex justify-end space-x-2'>
                                <button
                                    type='button'
                                    onClick={() => setOpen(false)}
                                    className='px-4 py-2 bg-gray-200 rounded'
                                >
                                    Cancel
                                </button>
                                <button type='submit' className='px-4 py-2 bg-green-600 text-white rounded'>
                                    Add
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            <div className='flex flex-col h-screen items-center justify-center'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold mb-4'>{`${campaignDetails.name} - Keywords`}</h1>
                    <button onClick={() => setOpen(true)} className='bg-blue-600 text-white px-4 py-2 rounded'>
                        Add keyword
                    </button>
                </div>

                <div className='flex justify-between items-center'>
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
                        {keywords.map((keyword) => (
                            <tr key={keyword.id} className='border-t hover:bg-gray-50'>
                                <td className='p-2 border'>{(keyword as any)[accessors[0]]}</td>
                                <td className='p-2 border'>{(keyword as any)[accessors[1]]}</td>
                                <td className='p-2 border space-x-2'>
                                    <Form method='post' className='inline'>
                                        <input type='hidden' name='_action' value='deleteKeyword' />
                                        <input type='hidden' name='keyword_id' value={keyword.id} />
                                        <button type='submit' className='text-red-600 hover:underline text-sm'>
                                            Delete
                                        </button>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Link to='/'>Back to all campaigns</Link>
            </div>
        </>
    );
}
