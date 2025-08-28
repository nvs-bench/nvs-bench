export interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

export interface MethodMeta {
  method_name: string;
  method_display_name: string;
  method_url: string;
}

export interface Result {
  method_name: string;
  dataset_name: string;
  scene_name: string;
  psnr: number;
  ssim: number;
  lpips: number;
  time: number;
  max_gpu_memory: number;
  hasPaperPsnr?: boolean;
  hasPaperSsim?: boolean;
  hasPaperLpips?: boolean;
}
