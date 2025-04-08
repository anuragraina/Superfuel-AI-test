import fs from 'fs/promises';
import path from 'path';

const CAMPAIGNS_PATH = path.join(process.cwd(), 'data', 'campaigns.json');
const KEYWORDS_PATH = path.join(process.cwd(), 'data', 'keywords.json');

export type Campaign = {
    id: number;
    name: string;
    daily_budget: number;
};

export type Keyword = {
    id: number;
    campaign_id: number;
    text: string;
    bid: number;
    match_type: 'exact' | 'phrase' | 'broad';
    state: 'enabled' | 'disabled';
};

export type CampaignDetails = {
    keywords: Keyword[];
    id: number;
    name: string;
    daily_budget: number;
};

export async function getCampaigns(): Promise<Campaign[]> {
    const data = await fs.readFile(CAMPAIGNS_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function addCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    const campaigns = await getCampaigns();
    const newId = Math.max(0, ...campaigns.map((c) => c.id)) + 1;

    const newCampaign: Campaign = { id: newId, ...campaign };

    if (campaigns.find((c) => c.name === campaign.name)) {
        throw new Error('Campaign name must be unique');
    }

    campaigns.push(newCampaign);
    await fs.writeFile(CAMPAIGNS_PATH, JSON.stringify(campaigns, null, 2));
    return newCampaign;
}

export async function editCampaign(updated: Campaign): Promise<void> {
    const campaigns = await getCampaigns();

    const index = campaigns.findIndex((c) => c.id === updated.id);
    if (index === -1) {
        throw new Error('Campaign not found');
    }

    campaigns[index] = { ...campaigns[index], ...updated };

    await fs.writeFile(CAMPAIGNS_PATH, JSON.stringify(campaigns, null, 2), 'utf-8');
}

export async function deleteCampaign(id: number): Promise<void> {
    const campaigns = await getCampaigns();
    const keywords = await getKeywords();

    const updatedCampaigns = campaigns.filter((c) => c.id !== id);
    const updatedKeywords = keywords.filter((k) => k.campaign_id !== id);

    await fs.writeFile(CAMPAIGNS_PATH, JSON.stringify(updatedCampaigns, null, 2));
    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(updatedKeywords, null, 2));
}

export async function getKeywords(): Promise<Keyword[]> {
    const data = await fs.readFile(KEYWORDS_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function addKeyword(keyword: Omit<Keyword, 'id'>): Promise<Keyword> {
    const keywords = await getKeywords();
    const campaignKeywords = keywords.filter((k) => k.campaign_id === keyword.campaign_id);
    const newId = Math.max(0, ...keywords.map((k) => k.id)) + 1;

    if (campaignKeywords.find((k) => k.text === keyword.text)) {
        throw new Error('Keyword text must be unique within the campaign');
    }

    const newKeyword: Keyword = { id: newId, ...keyword };
    keywords.push(newKeyword);

    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(keywords, null, 2));
    return newKeyword;
}

export async function deleteKeyword(id: number): Promise<void> {
    const keywords = await getKeywords();
    const updatedKeywords = keywords.filter((k) => k.id !== id);

    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(updatedKeywords, null, 2));
}

export async function getCampaignWithKeywords(campaignId: number): Promise<CampaignDetails> {
    const campaigns = await getCampaigns();
    const keywords = await getKeywords();
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (campaign) {
        const relatedKeywords = keywords.filter((k) => k.campaign_id === campaignId);
        return {
            ...campaign,
            keywords: relatedKeywords,
        };
    } else {
        throw Error('Campaign does not exist!');
    }
}
