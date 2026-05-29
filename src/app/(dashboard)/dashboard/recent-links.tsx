"use client";

import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentLink {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  createdAt: string | Date;
  _count: { clicks: number };
}

export function DashboardRecentLinks({ links }: { links: RecentLink[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Recent Links</CardTitle>
        <CardDescription>
          Your most recently created links.{" "}
          <NextLink
            href="/links"
            className="text-primary hover:underline font-medium"
          >
            View all →
          </NextLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-heading text-lg">No links yet</p>
            <p className="text-sm mt-1">
              <NextLink href="/links" className="text-primary hover:underline">
                Create your first link
              </NextLink>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <span className="truncate">{link.url}</span>
                      <ArrowSquareOutIcon className="size-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={link.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {link.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {link._count.clicks.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
