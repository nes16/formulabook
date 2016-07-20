# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# 
 Rails.application.config.assets.precompile << Proc.new do |path|
  if path =~ /\.(css|js|us)\z/
      puts "including asset: " + path
      true
  else
      puts "excluding asset: " + path
      false
  end
end
 
