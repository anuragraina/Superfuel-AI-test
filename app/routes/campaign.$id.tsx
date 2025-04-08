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
    const campaignDetails: CampaignDetails = useLoaderData();

    return (
        <div className='flex flex-col h-screen items-center justify-center'>
            <h1 className='text-2xl font-bold mb-4'>{`${campaignDetails.name} - Keywords`}</h1>
            {campaignDetails.keywords.map((keyword) => (
                <div key={keyword.id} className='border p-4 rounded flex justify-between items-center'>
                    <h2 className='text-xl font-semibold'>{keyword.text}</h2>

                    <Form method='POST'>
                        <input type='hidden' name='_action' value='deleteKeyword' />
                        <input type='hidden' name='keyword_id' value={keyword.id} />
                        <button type='submit'>Delete</button>
                    </Form>
                </div>
            ))}

            <Link to='/'>Back to all campaigns</Link>
        </div>
    );
}
