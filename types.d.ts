import { iconsList } from "@/components/elements/icon";
import { IconName as LucideIconName } from "lucide-react/dynamic";

declare global {
  interface Window {
    customerDetails?: ICustomerDetails;
  }
}

type HexColor = `#${string}` | `var(--${string})`;

type CssVar = `var(--${string})`;

type IconName = keyof typeof iconsList;

interface IPageData {
  id: string;
  offset: number;
}

type RemainingTime = {
  days: number;
  hours: number; 
  minutes: number;
  seconds: number;
}

interface ICustomerDetails {
  page_transitions: boolean;
  event_detail_location_enabled: boolean;
  hero_section_page_enabled: boolean; /* deprecated */
  our_story_page_enabled: boolean;
  event_details_page_enabled: boolean;
  timer_to_wedding_page_enabled: boolean;
  get_in_touch_page_enabled: boolean;
  request_to_guests_page_enabled: boolean;
  footer_page_enabled: boolean;
  wedding_date: string;
  first_human_name: string;
  second_human_name: string;
  ampersand: string;
  hero_section_title: string;
  day_of_the_month: string;
  month: string;
  time: string;
  our_story_title: string;
  our_story_text: string;
  event_details_title: string;
  event_details_items: IEventDetailsItem[];
  event_detail_google_maps_url: string;
  event_detail_location_title: string;
  event_detail_location_name: string;
  event_detail_location_address: string;
  timer_to_wedding_title: string;
  timer_to_wedding_label_days: string;
  timer_to_wedding_label_hours: string;
  timer_to_wedding_label_minutes: string;
  timer_to_wedding_label_seconds: string;
  get_in_touch_title: string;
  get_in_touch_text: string;
  get_in_touch_connection_list: IGetInTouchConnectionList[];
  request_to_quests_title: string;
  request_to_quests_text: string;
  request_to_quests_description: string;
  request_to_quests_link: string;
  footer_paragraphs: string[];
  footer_developer_text: string;
  footer_developer_name: string;
  footer_developer_link: string;
  gallery_password: string;
} 

interface IEventDetailsItem {
  image: IconName;
  title: string;
  paragraphs: string[];
  dress_code_colors?: string[];
}

interface IGetInTouchConnectionList {
  icon: LucideIconName;
  title: string;
  text: string;
  link: string;
}