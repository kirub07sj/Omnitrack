import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  firstName: string;
  lastName: string;
  url?: string;
  className?: string;
}

export function EmployeeAvatar({ firstName, lastName, url, className }: Props) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  
  return (
    <Avatar className={className}>
      <AvatarImage src={url} alt={`${firstName} ${lastName}`} />
      <AvatarFallback className="bg-primary/20 text-primary font-medium">{initials}</AvatarFallback>
    </Avatar>
  );
}
