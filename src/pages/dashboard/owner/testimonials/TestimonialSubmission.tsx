import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Upload,
  User,
  Check,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

function StarRating({
  rating,
  onChange,
  interactive = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`transition-all duration-200 ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function TestimonialSubmission() {
  const { sessionToken } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submissionStatus = useQuery(
    api.owner.testimonials.canSubmitTestimonial,
    sessionToken ? {} : "skip",
  );
  const guidelines = useQuery(
    api.owner.testimonials.getTestimonialGuidelines,
    sessionToken ? {} : "skip",
  );
  const myTestimonials = useQuery(
    api.owner.testimonials.getMyTestimonials,
    sessionToken ? {} : "skip",
  );
  const submitTestimonial = useMutation(
    api.owner.testimonials.submitTestimonial,
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write a testimonial");
      return;
    }

    if (content.length < (guidelines?.minLength || 50)) {
      toast.error(
        `Testimonial must be at least ${guidelines?.minLength || 50} characters`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTestimonial({
        content: content.trim(),
        starRating: rating,
        profilePhotoUrl: previewImage || undefined,
      });
      toast.success(
        "Testimonial submitted successfully! It will be reviewed and published soon.",
      );
      setContent("");
      setPreviewImage(null);
      setRating(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    submissionStatus === undefined ||
    guidelines === undefined ||
    myTestimonials === undefined
  ) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const canSubmit = submissionStatus?.canSubmit;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
          Share Your Experience
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help other pharmacy owners learn about PharmaCare by sharing your
          testimonial
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit Testimonial
            </CardTitle>
            <CardDescription>
              Your testimonial will be reviewed before being published
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!canSubmit ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cannot Submit</h3>
                <p className="text-muted-foreground">
                  {submissionStatus?.reason}
                </p>
                {submissionStatus?.existingTestimonial && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                    <p className="text-sm font-medium">
                      Your existing testimonial:
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Status:{" "}
                      <Badge
                        variant={
                          submissionStatus.existingTestimonial.status ===
                          "approved"
                            ? "default"
                            : submissionStatus.existingTestimonial.status ===
                                "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {submissionStatus.existingTestimonial.status}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <StarRating
                    rating={rating}
                    onChange={setRating}
                    interactive
                  />
                  <p className="text-sm text-muted-foreground">
                    {rating} out of 5 stars
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Profile Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/50 overflow-hidden"
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 2MB, JPG/PNG
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Your Testimonial
                    <span className="text-muted-foreground ml-1">
                      ({content.length}/{guidelines.maxLength} characters)
                    </span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Share your experience with PharmaCare..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px] resize-none"
                    maxLength={guidelines.maxLength}
                  />
                  <Progress
                    value={(content.length / guidelines.maxLength) * 100}
                    className="h-1"
                  />
                  {content.length < guidelines.minLength &&
                    content.length > 0 && (
                      <p className="text-xs text-amber-500">
                        Minimum {guidelines.minLength} characters required
                      </p>
                    )}
                </div>

                {/* Guidelines */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Guidelines
                  </Label>
                  <ul className="space-y-1">
                    {guidelines.guidelines.map(
                      (guideline: string, index: number) => (
                        <li
                          key={index}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{guideline}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || content.length < guidelines.minLength
                  }
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Testimonial
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* My Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
            <CardDescription>
              Track the status of your testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myTestimonials.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Submissions Yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  You have not submitted any testimonials yet. Share your
                  experience today!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTestimonials.map((testimonial: any) => (
                  <div
                    key={testimonial._id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {testimonial.status === "pending" && (
                          <>
                            <Clock className="h-4 w-4 text-amber-500" />
                            <Badge variant="secondary">Pending Review</Badge>
                          </>
                        )}
                        {testimonial.status === "approved" && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Badge variant="default">Approved</Badge>
                          </>
                        )}
                        {testimonial.status === "rejected" && (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <Badge variant="destructive">Not Approved</Badge>
                          </>
                        )}
                      </div>
                      <StarRating rating={testimonial.starRating} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      "{testimonial.content}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted on{" "}
                      {new Date(testimonial.submittedAt).toLocaleDateString()}
                    </p>
                    {testimonial.adminNotes && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <span className="font-medium">Admin Note:</span>{" "}
                        {testimonial.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TestimonialSubmission;
