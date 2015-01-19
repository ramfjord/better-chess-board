require 'sinatra'
require 'erb'

set :public_folder, File.dirname(__FILE__) + '/public'

get '/' do
  erb :board
end
