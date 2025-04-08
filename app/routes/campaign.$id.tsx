import { LoaderFunction, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { CampaignDetails, getCampaignWithKeywords } from '../lib/data.server';

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
    if (params.id) {
        const campaignDetails = await getCampaignWithKeywords(parseInt(params.id));

        return campaignDetails;
    }

    return {};
};

export default function CampaignDetailsPage() {
    const campaignDetails: CampaignDetails = useLoaderData();

    return (
        <div className='flex flex-col h-screen items-center justify-center'>
            <h1 className='text-2xl font-bold mb-4'>{`${campaignDetails.name} - Keywords`}</h1>
            {campaignDetails.keywords.map((keywords) => (
                <div key={keywords.id} className='border p-4 rounded flex justify-between items-center'>
                    <h2 className='text-xl font-semibold'>{keywords.text}</h2>
                    <button>Delete</button>
                </div>
            ))}

            <Link to='/'>Back to all campaigns</Link>
        </div>
    );
}
