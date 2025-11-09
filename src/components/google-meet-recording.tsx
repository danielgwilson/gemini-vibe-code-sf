"use client";

import { format } from "date-fns";
import { ExternalLinkIcon, FileVideoIcon, FileTextIcon, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Recording = {
  id: string;
  name: string;
  mimeType?: string;
  createdTime?: string;
  webViewLink?: string;
  isVideo?: boolean;
  isTranscript?: boolean;
};

type RecordingDetails = {
  id: string;
  name: string;
  mimeType?: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
};

type GoogleMeetRecordingOutput =
  | {
      success: true;
      action: "list";
      folderName?: string | null;
      folderId?: string | null;
      recordings: Recording[];
      count: number;
      error?: never;
    }
  | {
      success: true;
      action: "get_transcript";
      recordingId: string;
      transcriptId?: string | null;
      transcriptName?: string | null;
      transcript: string;
      transcriptLength: number;
      error?: never;
    }
  | {
      success: true;
      action: "get_details";
      recording: RecordingDetails;
      error?: never;
    }
  | {
      success?: false;
      error: string;
      action?: string;
    }
  | {
      success?: boolean;
      action?: string;
      error?: string;
      [key: string]: unknown;
    };

function formatFileSize(bytes?: string): string {
  if (!bytes) return "Unknown size";
  const numBytes = parseInt(bytes, 10);
  if (isNaN(numBytes)) return bytes;
  
  const units = ["B", "KB", "MB", "GB"];
  let size = numBytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown date";
  try {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateString;
  }
}

export function GoogleMeetRecording({
  output,
}: {
  output: GoogleMeetRecordingOutput | any;
}) {
  // Don't handle errors here - ToolOutput component handles them
  if (!output || output?.error || output?.success === false) {
    return null;
  }

  if (output?.action === "list" && output?.success === true) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Meet Recordings</CardTitle>
                {output.folderName && (
                  <CardDescription className="mt-1">
                    From "{output.folderName}" folder
                  </CardDescription>
                )}
              </div>
              <Badge variant="secondary">
                {output.count} {output.count === 1 ? "recording" : "recordings"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {output.recordings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FileVideoIcon className="mb-2 size-8" />
                <p>No recordings found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {output.recordings.map((recording: Recording) => (
                  <Card
                    key={recording.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      recording.isTranscript && "border-blue-200 dark:border-blue-800"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-1 shrink-0 rounded p-2",
                          recording.isVideo
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : recording.isTranscript
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-muted"
                        )}>
                          {recording.isVideo ? (
                            <FileVideoIcon className="size-5 text-blue-600 dark:text-blue-400" />
                          ) : recording.isTranscript ? (
                            <FileTextIcon className="size-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <FileTextIcon className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm line-clamp-2">
                              {recording.name}
                            </CardTitle>
                            {recording.webViewLink && (
                              <a
                                href={recording.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLinkIcon className="size-4" />
                              </a>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {recording.createdTime && (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <CalendarIcon className="size-3" />
                                <span>{formatDate(recording.createdTime)}</span>
                              </div>
                            )}
                            {recording.isTranscript && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Transcript
                              </Badge>
                            )}
                            {recording.isVideo && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Video
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (output?.action === "get_transcript" && output?.success === true) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transcript</CardTitle>
              {output.transcriptName && (
                <CardDescription className="mt-1">
                  {output.transcriptName}
                </CardDescription>
              )}
            </div>
            <Badge variant="secondary">
              {output.transcriptLength.toLocaleString()} characters
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {output.transcript}
              </pre>
            </div>
          </div>
          {output.recordingId && (
            <div className="mt-4 text-muted-foreground text-xs">
              Recording ID: <code className="rounded bg-muted px-1 py-0.5 font-mono">{output.recordingId}</code>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (output?.action === "get_details" && output?.success === true) {
    const recording = output.recording;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recording Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <CardDescription className="mb-1 text-xs font-medium uppercase tracking-wide">
              Name
            </CardDescription>
            <div className="font-medium">{recording.name}</div>
          </div>

          {recording.createdTime && (
            <div>
              <CardDescription className="mb-1 text-xs font-medium uppercase tracking-wide">
                Created
              </CardDescription>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4" />
                <span>{formatDate(recording.createdTime)}</span>
              </div>
            </div>
          )}

          {recording.size && (
            <div>
              <CardDescription className="mb-1 text-xs font-medium uppercase tracking-wide">
                Size
              </CardDescription>
              <div>{formatFileSize(recording.size)}</div>
            </div>
          )}

          {recording.mimeType && (
            <div>
              <CardDescription className="mb-1 text-xs font-medium uppercase tracking-wide">
                Type
              </CardDescription>
              <Badge variant="outline" className="font-mono">
                {recording.mimeType}
              </Badge>
            </div>
          )}

          {(recording.webViewLink || recording.webContentLink) && (
            <div>
              <CardDescription className="mb-2 text-xs font-medium uppercase tracking-wide">
                Links
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {recording.webViewLink && (
                  <a
                    href={recording.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <ExternalLinkIcon className="size-4" />
                    View in Drive
                  </a>
                )}
                {recording.webContentLink && (
                  <a
                    href={recording.webContentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <ExternalLinkIcon className="size-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

