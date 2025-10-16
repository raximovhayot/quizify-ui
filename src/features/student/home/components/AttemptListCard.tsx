import React, {JSX} from 'react';

import {DataCard} from '@/components/shared/ui/DataCard';
import {AttemptListingData} from '@/features/student/quiz/types/attempt';
import {AttemptSimpleList} from './AttemptSimpleList';
import { ListSkeleton } from '@/components/atomic/molecules';

interface AttemptListCardProps {
    title: string;
    icon: JSX.Element;
    isLoading: boolean;
    hasError: boolean;
    errorText: string;
    items?: AttemptListingData[];
    emptyLabel: string;
}

export function AttemptListCard({
                                    title,
                                    icon,
                                    isLoading,
                                    hasError,
                                    errorText,
                                    items,
                                    emptyLabel,
                                }: AttemptListCardProps) {
    return (
        <DataCard title={title} icon={icon} isLoading={isLoading} error={hasError ? errorText : undefined}>
            {isLoading ? (
                <ListSkeleton/>
            ) : (
                <AttemptSimpleList items={items || []} emptyLabel={emptyLabel} icon={icon}/>
            )}
        </DataCard>
    );
}

export default AttemptListCard;
