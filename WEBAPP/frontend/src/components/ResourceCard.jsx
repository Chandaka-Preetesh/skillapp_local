import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, Trash2, Link as LinkIcon, FileText, Video, Book, File, MessageCircle, Share2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ResourceCard = ({ resource, onLike, onRate, onDelete, isOwner }) => {
  const {
    id,
    title,
    description,
    url,
    file_url,
    type,
    likes,
    topic_name,
    author_name,
    author_picture,
    average_rating,
    created_at
  } = resource;

  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      onDelete(id);
    }
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    onRate(id, rating);
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'book':
        return <Book className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'tool':
        return <File className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6 space-y-4">
        {/* Author and metadata section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10"> 
              <AvatarImage src={author_picture} alt={author_name} />
              <AvatarFallback>{author_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{author_name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(created_at)}
                </span>
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                >
                  {topic_name}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(type)}
              <span className="capitalize">{type}</span>
            </Badge>
            {/* Rating display */}
            <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
              <span>{average_rating ? parseFloat(average_rating).toFixed(1) : '0.0'}</span>
            </div>
          </div>
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Resource link */}
        {url && (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <LinkIcon className="h-3 w-3 mr-1" /> View Resource
          </a>
        )}

        {/* File link if available */}
        {file_url && (
          <a 
            href={file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <File className="h-3 w-3 mr-1" /> View File
          </a>
        )}

        {/* Rating stars - updated to 10-point scale */}
        <div className="flex items-center space-x-1 flex-wrap">
          <span className="text-sm text-gray-600 mr-2">Rate (1-10):</span>
          <div className="flex flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <Star 
                key={star}
                className={cn(
                  "h-4 w-4 cursor-pointer",
                  (hoverRating >= star || userRating >= star) 
                    ? "text-yellow-500 fill-yellow-500" 
                    : "text-gray-300"
                )}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRating(star)}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} text-sm`}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? 'fill-blue-600' : ''}`} />
              <span>{likes || 0}</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>Comment</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm">
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </button>
          </div>
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;