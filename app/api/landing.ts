import api from '~/api/index'
import type {
  AnnouncementBar,
  HeroSlide,
  MegamenuCategory,
  CategoryCarouselItem,
  AgeGroup,
  FooterData,
  NewsletterCategory,
} from '@@/types/index'

export const getAnnouncementBar = () =>
  api.get<{ data: AnnouncementBar | null }>('/landing/announcement-bar')

export const getHeroSlides = () =>
  api.get<{ data: HeroSlide[] }>('/landing/hero-slides')

export const getMegamenu = () =>
  api.get<{ data: MegamenuCategory[] }>('/landing/megamenu')

export const getCategoryCarousel = () =>
  api.get<{ data: CategoryCarouselItem[] }>('/landing/category-carousel')

export const getAgeGroups = () =>
  api.get<{ data: AgeGroup[] }>('/landing/age-groups')

export const getFooter = () =>
  api.get<{ data: FooterData }>('/landing/footer')

export const getNewsletterCategories = () =>
  api.get<{ data: NewsletterCategory[] }>('/landing/newsletter-categories')
