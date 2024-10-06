import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import genreData from './genres.json'
import ratingData from './ratings.json'
import {useInfiniteQuery} from '@tanstack/react-query';
import { MovieListResult } from '@/types/MovieListResponse';
import { Genre, Rating } from '@/types/types';
import { Card } from '@/components/ui/card';
import { Badge } from 'lucide-react';



const MovieboxScroll = () => {

    const [genreIds, setGenreIds] = useState<number[]>([])
    const client = useContext(TMDBClientContext)

    const movieListRef = useRef(null);

    const handleFilterButtons = (filter : number) => {
        setGenreIds((prevFilters : number[]) =>
            prevFilters.includes(filter)
                ? prevFilters.filter((it) => it != filter)
                : [...prevFilters, filter]
        )
    }

    

    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['trendingMovies', genreIds],
        queryFn: ({ pageParam }) => client.fetchMovieList(pageParam, "movie", genreIds),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            } else {
                return undefined;
            }
        },
    });

    useEffect(() => {
        const handleScroll = () => {
            //checking if we are near the bottom of the screen
            if(window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50) {
                fetchNextPage().catch((e) => alert(e.toLocaleString()))
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)

    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    

    const items = useMemo(() => {
        return data?.pages.flatMap((page) => page.results) ?? []

    }, [data, genreIds])

    
    return (
        <div className="flex md:flex-row flex-col h-full w-full pe-12">
            <div className="md:w-1/4 w-full sm:row-span-1">
                <FilterSideBar
                    genres={genreData.genres}
                    ratings={ratingData.certifications.US.sort((a, b) => a.order - b.order)}
                    selectedGenres={genreIds}
                    onFilterClick={(filter) => handleFilterButtons(filter)}
                />
            </div>
            <div className="md:w-3/4 w-full grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((movie: MovieListResult) => (
                    <div>
                        <Moviebox key={movie.id} item={movie} inList={false} lst={undefined}></Moviebox>
                    </div>))}
            </div>
        </div>
    )
}


type FilterSidebarProps = {
    genres: Genre[]
    ratings: Rating[]
    selectedGenres: number[],
    onFilterClick: (id: number) => void
}

const FilterSideBar = (
    { genres, selectedGenres, onFilterClick, ratings }: FilterSidebarProps
) => {
    return (
        <div className="ms-4 me-4">

            <Card className="rounded-md shadow-card p-4">
                <h2 className="sm:text-3xl font-semibold p-1">Sort</h2>
                <Select>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Theme"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </Card>

            <Card className="rounded-md shadow-card mt-4 mb-4">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight m-4">Genres</h2>
                {genres.map(({id, name}) => {
                    const selected = selectedGenres.includes(id)
                    return (
                        <Badge
                            itemID={id.toString()}
                            className="hover:bg-primary rounded-md ms-2 mb-1"
                            onClick={() => onFilterClick(id)}
                            variant={selected ? "default" : "outline"}
                            id={id.toString()}
                        >{name}
                        </Badge>
                    )
                })}
                <div className="p-2"/>

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight m-4">Ratings</h2>
                {ratings.map((rating) => {
                    const selected = false
                    return (
                        <Badge
                            itemID={rating.certification + rating.order}
                            className="hover:bg-primary rounded-md ms-2 mb-1"
                            onClick={() => {}}
                            variant={selected ? "default" : "outline"}
                            id={rating.order.toString()}
                        >{rating.certification}
                        </Badge>
                    )
                })}
                <div className="p-2"/>
            </Card>
        </div>
    )
}


export default MovieboxScroll